-- =============================================================================
-- Atomic coupon usage increment RPC
-- Prevents race condition when multiple orders use the same coupon concurrently
-- =============================================================================

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(
    p_coupon_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
BEGIN
    -- Lock the coupon row to prevent concurrent increments
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE id = p_coupon_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Coupon not found: %', p_coupon_id;
    END IF;

    -- Re-check usage limit atomically (guards against concurrent bypass)
    IF v_coupon.usage_limit > 0 AND v_coupon.used_count >= v_coupon.usage_limit THEN
        RAISE EXCEPTION 'Coupon usage limit reached';
    END IF;

    -- Atomic increment (single SQL statement, no read-then-write gap)
    UPDATE public.coupons
    SET used_count = used_count + 1,
        updated_at = now()
    WHERE id = p_coupon_id;

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage TO authenticated;
