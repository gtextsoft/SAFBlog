-- Add unsubscribed_at column to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers
ADD COLUMN IF NOT EXISTS unsubscribed_at TIMESTAMPTZ;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_unsubscribed_at ON public.newsletter_subscribers(unsubscribed_at);

