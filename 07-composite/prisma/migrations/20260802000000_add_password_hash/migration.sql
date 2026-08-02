-- Adds the only repeatable production sign-in credential for staff and
-- customers. Both columns are nullable: existing staff rows created via
-- invite/dev-auth and guest-checkout customers have none until they set one.
ALTER TABLE "staff_users" ADD COLUMN "passwordHash" TEXT;
ALTER TABLE "customers" ADD COLUMN "passwordHash" TEXT;
