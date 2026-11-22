CREATE TABLE public.apartment_auctions (
  id text PRIMARY KEY,
  title text NOT NULL,
  start_price_etb numeric(12,2) NOT NULL,
  target_bids integer NOT NULL DEFAULT 10000,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'open',
  winner_bid_id uuid,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apartment_auctions TO anon, authenticated;
GRANT ALL ON public.apartment_auctions TO service_role;
ALTER TABLE public.apartment_auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apartment auctions are public" ON public.apartment_auctions FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.apartment_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id text NOT NULL REFERENCES public.apartment_auctions(id) ON DELETE CASCADE,
  amount_etb numeric(12,2) NOT NULL,
  bidder_label text NOT NULL,
  phone_masked text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX apartment_bids_auction_amount_idx ON public.apartment_bids (auction_id, amount_etb DESC);
CREATE INDEX apartment_bids_auction_created_idx ON public.apartment_bids (auction_id, created_at DESC);
GRANT SELECT ON public.apartment_bids TO anon, authenticated;
GRANT ALL ON public.apartment_bids TO service_role;
ALTER TABLE public.apartment_bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Apartment bids are public" ON public.apartment_bids FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.apartment_bid_contacts (
  bid_id uuid PRIMARY KEY REFERENCES public.apartment_bids(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX apartment_bid_contacts_phone_idx ON public.apartment_bid_contacts (phone, created_at DESC);
GRANT ALL ON public.apartment_bid_contacts TO service_role;
ALTER TABLE public.apartment_bid_contacts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_apartment_auctions_updated_at BEFORE UPDATE ON public.apartment_auctions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ends the auction when its time is up or the bid target is reached; picks the highest bid.
CREATE OR REPLACE FUNCTION public.finalize_apartment_auction(p_auction_id text)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  a public.apartment_auctions%ROWTYPE;
  n integer;
  top_id uuid;
BEGIN
  SELECT * INTO a FROM public.apartment_auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND OR a.status <> 'open' THEN RETURN; END IF;
  SELECT count(*) INTO n FROM public.apartment_bids WHERE auction_id = p_auction_id;
  IF (a.ends_at IS NOT NULL AND now() >= a.ends_at) OR n >= a.target_bids THEN
    SELECT id INTO top_id FROM public.apartment_bids
      WHERE auction_id = p_auction_id ORDER BY amount_etb DESC, created_at ASC LIMIT 1;
    UPDATE public.apartment_auctions
      SET status = 'ended', winner_bid_id = top_id, ended_at = now()
      WHERE id = p_auction_id;
  END IF;
END;
$$;

-- Places a bid atomically: must beat the current top (or the start price), auction must be open.
CREATE OR REPLACE FUNCTION public.place_apartment_bid(
  p_auction_id text, p_amount numeric, p_label text, p_phone_masked text,
  p_full_name text, p_phone text, p_cooldown_seconds integer
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  a public.apartment_auctions%ROWTYPE;
  top_amount numeric;
  last_at timestamptz;
  new_id uuid;
  new_at timestamptz;
BEGIN
  PERFORM public.finalize_apartment_auction(p_auction_id);
  SELECT * INTO a FROM public.apartment_auctions WHERE id = p_auction_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
  IF a.status <> 'open' THEN RETURN jsonb_build_object('ok', false, 'reason', 'ended'); END IF;

  SELECT max(amount_etb) INTO top_amount FROM public.apartment_bids WHERE auction_id = p_auction_id;
  IF p_amount <= coalesce(top_amount, a.start_price_etb) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'too_low', 'current', coalesce(top_amount, a.start_price_etb));
  END IF;

  SELECT max(c.created_at) INTO last_at FROM public.apartment_bid_contacts c
    JOIN public.apartment_bids b ON b.id = c.bid_id
    WHERE c.phone = p_phone AND b.auction_id = p_auction_id;
  IF last_at IS NOT NULL AND now() < last_at + make_interval(secs => p_cooldown_seconds) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'too_fast');
  END IF;

  INSERT INTO public.apartment_bids (auction_id, amount_etb, bidder_label, phone_masked)
    VALUES (p_auction_id, p_amount, p_label, p_phone_masked)
    RETURNING id, created_at INTO new_id, new_at;
  INSERT INTO public.apartment_bid_contacts (bid_id, full_name, phone) VALUES (new_id, p_full_name, p_phone);

  PERFORM public.finalize_apartment_auction(p_auction_id);
  RETURN jsonb_build_object('ok', true, 'id', new_id, 'created_at', new_at);
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_apartment_auction(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.place_apartment_bid(text, numeric, text, text, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_apartment_auction(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.place_apartment_bid(text, numeric, text, text, text, text, integer) TO service_role;

ALTER PUBLICATION supabase_realtime ADD TABLE public.apartment_bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.apartment_auctions;

INSERT INTO public.apartment_auctions (id, title, start_price_etb, target_bids)
VALUES ('bole-penthouse', 'ለግዠሪ አፓርታማ — ቦሌ', 700, 10000);