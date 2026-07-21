-- Allow confirm/resubscribe without service_role by using a shared secret
-- (same value as NEWSLETTER_TOKEN_SECRET in the app).

CREATE TABLE IF NOT EXISTS public.newsletter_app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_app_secrets ENABLE ROW LEVEL SECURITY;
-- No policies: only SECURITY DEFINER functions can touch this table.

CREATE OR REPLACE FUNCTION public.newsletter_confirm(p_email text, p_secret text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected text;
BEGIN
  SELECT value INTO expected FROM public.newsletter_app_secrets WHERE key = 'token_secret';
  IF expected IS NULL OR p_secret IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  UPDATE public.newsletter_subscribers
  SET
    status = 'subscribed',
    confirmed_at = now(),
    unsubscribed_at = null
  WHERE lower(email) = lower(trim(p_email));

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.newsletter_request_resubscribe(
  p_email text,
  p_full_name text,
  p_source text,
  p_secret text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected text;
  current_status text;
BEGIN
  SELECT value INTO expected FROM public.newsletter_app_secrets WHERE key = 'token_secret';
  IF expected IS NULL OR p_secret IS DISTINCT FROM expected THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT status INTO current_status
  FROM public.newsletter_subscribers
  WHERE lower(email) = lower(trim(p_email));

  IF current_status IS NULL THEN
    RETURN 'missing';
  END IF;

  IF current_status = 'subscribed' THEN
    RETURN 'already_subscribed';
  END IF;

  UPDATE public.newsletter_subscribers
  SET
    status = 'pending',
    unsubscribed_at = null,
    confirmed_at = null,
    full_name = COALESCE(nullif(trim(p_full_name), ''), full_name),
    source = COALESCE(nullif(trim(p_source), ''), source)
  WHERE lower(email) = lower(trim(p_email));

  RETURN 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.newsletter_confirm(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.newsletter_request_resubscribe(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_confirm(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.newsletter_request_resubscribe(text, text, text, text) TO anon, authenticated, service_role;

REVOKE ALL ON TABLE public.newsletter_app_secrets FROM PUBLIC;
REVOKE ALL ON TABLE public.newsletter_app_secrets FROM anon, authenticated;

-- First server call seeds the secret from NEWSLETTER_TOKEN_SECRET (insert-if-missing).
CREATE OR REPLACE FUNCTION public.newsletter_ensure_secret(p_secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing text;
BEGIN
  IF p_secret IS NULL OR length(trim(p_secret)) < 16 THEN
    RAISE EXCEPTION 'invalid secret';
  END IF;

  SELECT value INTO existing FROM public.newsletter_app_secrets WHERE key = 'token_secret';

  IF existing IS NULL THEN
    INSERT INTO public.newsletter_app_secrets (key, value)
    VALUES ('token_secret', trim(p_secret));
  ELSIF existing IS DISTINCT FROM trim(p_secret) THEN
    RAISE EXCEPTION 'secret mismatch';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.newsletter_ensure_secret(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.newsletter_ensure_secret(text) TO anon, authenticated, service_role;
