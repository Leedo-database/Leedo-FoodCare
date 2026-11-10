# Security Specification: LEEDO FOODCARE

## 1. Data Invariants
1. EID identity integrity: Only authenticated employees may write records, and every transaction must record the employee's genuine EID.
2. Immutability of Audit Logs: Ordinary users can never modify or delete audit log entries.
3. Central Stock Non-Negativity: Dispatches cannot exceed available stock.
4. Receiving Confirmation integrity: Facilities must independently confirm actual received quantities; dispatched quantities cannot be altered by receiving facility staff.
5. Separation of Food vs Non-Food: Only food items contribute to Food Cost per Child calculation.
6. Role Escalation Prevention: Employees cannot promote themselves or alter their own roles or permissions.
7. Password Security: Users must change default initial password before getting authorized dashboard access.
8. Monthly Closing Lock: Once a financial month is closed, past transactions cannot be altered without authorized reopening.

## 2. The Dirty Dozen Payloads (Adversarial Security Test Cases)
1. **Self-Promote Admin**: Non-admin employee attempts to update `role: "super_admin"` on their own profile -> PERMISSION_DENIED.
2. **Audit Log Tampering**: User attempts to update or delete an `audit_logs` document -> PERMISSION_DENIED.
3. **Ghost Dispatch Spoofing**: Field worker attempts to create a central `purchases` entry without logistics/finance role -> PERMISSION_DENIED.
4. **Negative Inventory Injection**: Updating stock quantity to negative number -> PERMISSION_DENIED.
5. **Direct Receiving Modification**: Receiving facility attempting to alter `dispatchedQty` on a distribution record -> PERMISSION_DENIED.
6. **Fake Invoice Verification**: Field staff attempting to mark `verificationStatus: "approved"` without accountant role -> PERMISSION_DENIED.
7. **Junk ID Poisoning**: Document creation with an ID containing malicious symbols (>128 chars or special control characters) -> PERMISSION_DENIED.
8. **PII Scraping via Unbounded List**: Non-HR user querying all employee records including private credentials -> PERMISSION_DENIED.
9. **Bypassing Mandatory Password Change**: User with `passwordChanged: false` attempting to create purchase or budget mutations -> PERMISSION_DENIED.
10. **Budget Override**: Unauthorized user modifying approved monthly budget amounts -> PERMISSION_DENIED.
11. **Shadow Field Injection**: Injecting arbitrary extra fields like `approvedByDirector: true` into a requisition -> PERMISSION_DENIED.
12. **Historical Closed Month Modification**: Attempting to alter consumption entries for a month marked `closed: true` -> PERMISSION_DENIED.
