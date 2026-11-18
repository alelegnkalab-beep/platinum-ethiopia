REVOKE SELECT (bidder_name, amount_etb) ON public.payo_bids FROM anon, authenticated;
CREATE INDEX IF NOT EXISTS payo_bids_product_status_idx ON public.payo_bids (product_id, status);