# ADR-0016: Approved staff time-off attendance integration

- Status: Accepted for M8-B5

Approved Staff/HR time-off remains the source of absence authorization. The
staff attendance workspace reads that outcome through its existing
caller-bound assignment query; it does not copy, approve or mutate a request.

A request marks a scheduled day `excused` only when its approved interval
covers the complete effective working-hours policy in the school's configured
IANA timezone. Partial-day permissions remain visible but do not suppress the
normal clock requirement. This prevents a short permission from becoming a
full-day absence exemption.

The integration returns no reason, approval detail or protected identity. It
reuses `can_access_staff_attendance_assignment`, keeps anonymous execution
revoked and performs no write. Disabling the request-entry feature does not
erase the operational effect of an already approved request.
