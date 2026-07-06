REVOKE EXECUTE ON FUNCTION public.create_reservation_hold(UUID, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.attach_razorpay_order(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_reservation(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_stale_reservations() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_reservation_cancellation(UUID, NUMERIC, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.convert_reservation_to_sale(UUID, TEXT, NUMERIC, NUMERIC) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.check_refund_eligibility(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.calc_reservation_amount(NUMERIC) FROM PUBLIC, anon;

-- The staff-only conversion + eligibility RPCs remain callable by authenticated
-- (they self-check is_staff() inside), but not by anonymous.
GRANT EXECUTE ON FUNCTION public.convert_reservation_to_sale(UUID, TEXT, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_refund_eligibility(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calc_reservation_amount(NUMERIC) TO authenticated;