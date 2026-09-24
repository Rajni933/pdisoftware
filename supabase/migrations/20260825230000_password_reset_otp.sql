-- ============================================================================
-- AUTOPRIME PDI PLATFORM — PASSWORD RESET WITH REGISTERED EMAIL OTP
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS password_reset_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Request Password Reset OTP
CREATE OR REPLACE FUNCTION request_password_reset(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_user RECORD;
    v_otp TEXT;
    v_masked_email TEXT;
    v_email_parts TEXT[];
    v_username_part TEXT;
    v_domain_part TEXT;
BEGIN
    SELECT id, employee_id, user_code, email, first_name, last_name
    INTO v_user
    FROM users
    WHERE LOWER(COALESCE(employee_id, '')) = LOWER(TRIM(p_username))
       OR LOWER(COALESCE(user_code, '')) = LOWER(TRIM(p_username))
       OR LOWER(COALESCE(email, '')) = LOWER(TRIM(p_username))
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Username not found in system.');
    END IF;

    IF v_user.email IS NULL OR v_user.email = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'No registered email found for this user. Please contact administration.');
    END IF;

    -- Generate 6 digit numeric OTP
    v_otp := LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0');

    -- Delete any old OTPs for this user
    DELETE FROM password_reset_otps WHERE user_id = v_user.id;

    -- Insert new OTP valid for 15 minutes
    INSERT INTO password_reset_otps (user_id, username, email, otp, expires_at)
    VALUES (v_user.id, COALESCE(v_user.employee_id, v_user.user_code), v_user.email, v_otp, NOW() + INTERVAL '15 minutes');

    -- Mask email e.g. ad***n@dhootgroup.com
    v_email_parts := string_to_array(v_user.email, '@');
    v_username_part := v_email_parts[1];
    v_domain_part := v_email_parts[2];
    IF length(v_username_part) > 2 THEN
        v_masked_email := substring(v_username_part from 1 for 2) || '***' || substring(v_username_part from length(v_username_part) for 1) || '@' || v_domain_part;
    ELSE
        v_masked_email := substring(v_username_part from 1 for 1) || '***@' || v_domain_part;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'OTP has been dispatched to your registered email.',
        'masked_email', v_masked_email,
        'email', v_user.email,
        'otp', v_otp
    );
END;
$$;

-- 2. Verify OTP & Change Password
CREATE OR REPLACE FUNCTION verify_reset_otp_and_change_password(p_username TEXT, p_otp TEXT, p_new_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    v_otp_record RECORD;
BEGIN
    IF p_new_password IS NULL OR length(p_new_password) < 4 THEN
        RETURN jsonb_build_object('success', false, 'message', 'New password must be at least 4 characters long.');
    END IF;

    SELECT * INTO v_otp_record
    FROM password_reset_otps
    WHERE (LOWER(username) = LOWER(TRIM(p_username)) OR LOWER(email) = LOWER(TRIM(p_username)))
      AND otp = TRIM(p_otp)
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid or expired OTP code. Please try again.');
    END IF;

    -- Update user password hash
    UPDATE users
    SET password_hash = crypt(p_new_password, gen_salt('bf'))
    WHERE id = v_otp_record.user_id;

    -- Invalidate used OTP
    DELETE FROM password_reset_otps WHERE user_id = v_otp_record.user_id;

    RETURN jsonb_build_object('success', true, 'message', 'Password updated successfully! Please sign in with your new password.');
END;
$$;

GRANT EXECUTE ON FUNCTION request_password_reset(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION verify_reset_otp_and_change_password(TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
