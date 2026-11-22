use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

/// Strictly canonical three-tier administrative management roles.
/// Legacy or retired roles (owner, superadmin, teacher, counselor, principal, management)
/// as well as end-user roles (kid, teen, young-adult) are permanently excluded.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ManagementRole {
    SuperAdmin,
    Admin,
    Staff,
}

impl ManagementRole {
    pub fn parse_strict(raw: &str) -> Option<Self> {
        let trimmed = raw.trim().to_lowercase();
        match trimmed.as_str() {
            "super_admin" => Some(Self::SuperAdmin),
            "admin" => Some(Self::Admin),
            "staff" => Some(Self::Staff),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::SuperAdmin => "super_admin",
            Self::Admin => "admin",
            Self::Staff => "staff",
        }
    }
}

impl fmt::Display for ManagementRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Strictly canonical account approval lifecycle statuses.
#[allow(dead_code)]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "UPPERCASE")]
pub enum ApprovalStatus {
    Pending,
    Approved,
    Rejected,
}

#[allow(dead_code)]
impl ApprovalStatus {
    pub fn parse_strict(raw: &str) -> Option<Self> {
        let trimmed = raw.trim().to_uppercase();
        match trimmed.as_str() {
            "PENDING" => Some(Self::Pending),
            "APPROVED" => Some(Self::Approved),
            "REJECTED" => Some(Self::Rejected),
            _ => None,
        }
    }

    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "PENDING",
            Self::Approved => "APPROVED",
            Self::Rejected => "REJECTED",
        }
    }
}

impl fmt::Display for ApprovalStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Standardized uppercase immutable governance audit actions.
pub struct GovernanceAction;

impl GovernanceAction {
    pub const MANAGEMENT_SIGNUP: &'static str = "MANAGEMENT_SIGNUP";
    pub const ACCOUNT_APPROVED: &'static str = "ACCOUNT_APPROVED";
    pub const ACCOUNT_REJECTED: &'static str = "ACCOUNT_REJECTED";
    pub const ACCOUNT_SUSPENDED: &'static str = "ACCOUNT_SUSPENDED";
    pub const ACCOUNT_REACTIVATED: &'static str = "ACCOUNT_REACTIVATED";
    pub const ACCOUNT_DELETED: &'static str = "ACCOUNT_DELETED";
    pub const MANAGEMENT_PASSWORD_RESET: &'static str = "MANAGEMENT_PASSWORD_RESET";

    pub fn is_valid(action: &str) -> bool {
        matches!(
            action,
            Self::MANAGEMENT_SIGNUP
                | Self::ACCOUNT_APPROVED
                | Self::ACCOUNT_REJECTED
                | Self::ACCOUNT_SUSPENDED
                | Self::ACCOUNT_REACTIVATED
                | Self::ACCOUNT_DELETED
                | Self::MANAGEMENT_PASSWORD_RESET
        )
    }
}

/// Pure authorization hierarchy matrix for approval and rejection:
/// - SuperAdmin can approve/reject Admin and Staff, but not SuperAdmin.
/// - Admin can approve/reject Staff only, never Admin or SuperAdmin.
/// - Staff cannot approve or reject anyone.
pub fn can_approve_or_reject(actor: ManagementRole, target: ManagementRole) -> bool {
    match actor {
        ManagementRole::SuperAdmin => {
            target == ManagementRole::Admin || target == ManagementRole::Staff
        }
        ManagementRole::Admin => target == ManagementRole::Staff,
        ManagementRole::Staff => false,
    }
}

/// Pure authorization hierarchy matrix for suspension, reactivation, and soft deletion:
/// - Must return false if actor_id == target_id (unbypassable self-protection).
/// - Must return false if target == SuperAdmin (super-admin lockout protection).
/// - Returns true strictly when actor == SuperAdmin and target is Admin or Staff.
/// - Returns false for Admin and Staff unconditionally.
pub fn can_suspend_reactivate_or_delete(
    actor: ManagementRole,
    actor_id: Uuid,
    target: ManagementRole,
    target_id: Uuid,
) -> bool {
    if actor_id == target_id {
        return false;
    }
    if target == ManagementRole::SuperAdmin {
        return false;
    }
    actor == ManagementRole::SuperAdmin
        && (target == ManagementRole::Admin || target == ManagementRole::Staff)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_management_role_parse_strict() {
        assert_eq!(
            ManagementRole::parse_strict("super_admin"),
            Some(ManagementRole::SuperAdmin)
        );
        assert_eq!(
            ManagementRole::parse_strict("  SUPER_ADMIN  "),
            Some(ManagementRole::SuperAdmin)
        );
        assert_eq!(
            ManagementRole::parse_strict("admin"),
            Some(ManagementRole::Admin)
        );
        assert_eq!(
            ManagementRole::parse_strict(" staff "),
            Some(ManagementRole::Staff)
        );

        // Strict rejection of legacy strings
        assert_eq!(ManagementRole::parse_strict("owner"), None);
        assert_eq!(ManagementRole::parse_strict("superadmin"), None);
        assert_eq!(ManagementRole::parse_strict("teacher"), None);
        assert_eq!(ManagementRole::parse_strict("counselor"), None);
        assert_eq!(ManagementRole::parse_strict("principal"), None);
        assert_eq!(ManagementRole::parse_strict("management"), None);

        // Strict rejection of end-user roles
        assert_eq!(ManagementRole::parse_strict("kid"), None);
        assert_eq!(ManagementRole::parse_strict("teen"), None);
        assert_eq!(ManagementRole::parse_strict("young-adult"), None);
        assert_eq!(ManagementRole::parse_strict(""), None);
    }

    #[test]
    fn test_approval_status_parse_strict() {
        assert_eq!(
            ApprovalStatus::parse_strict("PENDING"),
            Some(ApprovalStatus::Pending)
        );
        assert_eq!(
            ApprovalStatus::parse_strict("pending"),
            Some(ApprovalStatus::Pending)
        );
        assert_eq!(
            ApprovalStatus::parse_strict("APPROVED"),
            Some(ApprovalStatus::Approved)
        );
        assert_eq!(
            ApprovalStatus::parse_strict("approved"),
            Some(ApprovalStatus::Approved)
        );
        assert_eq!(
            ApprovalStatus::parse_strict("REJECTED"),
            Some(ApprovalStatus::Rejected)
        );
        assert_eq!(
            ApprovalStatus::parse_strict("rejected"),
            Some(ApprovalStatus::Rejected)
        );
        assert_eq!(ApprovalStatus::parse_strict("unknown"), None);
    }

    #[test]
    fn test_can_approve_or_reject_matrix() {
        // SuperAdmin approvals
        assert!(can_approve_or_reject(
            ManagementRole::SuperAdmin,
            ManagementRole::Staff
        ));
        assert!(can_approve_or_reject(
            ManagementRole::SuperAdmin,
            ManagementRole::Admin
        ));
        assert!(!can_approve_or_reject(
            ManagementRole::SuperAdmin,
            ManagementRole::SuperAdmin
        ));

        // Admin approvals
        assert!(can_approve_or_reject(
            ManagementRole::Admin,
            ManagementRole::Staff
        ));
        assert!(!can_approve_or_reject(
            ManagementRole::Admin,
            ManagementRole::Admin
        ));
        assert!(!can_approve_or_reject(
            ManagementRole::Admin,
            ManagementRole::SuperAdmin
        ));

        // Staff approvals
        assert!(!can_approve_or_reject(
            ManagementRole::Staff,
            ManagementRole::Staff
        ));
        assert!(!can_approve_or_reject(
            ManagementRole::Staff,
            ManagementRole::Admin
        ));
        assert!(!can_approve_or_reject(
            ManagementRole::Staff,
            ManagementRole::SuperAdmin
        ));
    }

    #[test]
    fn test_can_suspend_reactivate_or_delete_matrix() {
        let id1 = Uuid::new_v4();
        let id2 = Uuid::new_v4();

        // SuperAdmin acting on others
        assert!(can_suspend_reactivate_or_delete(
            ManagementRole::SuperAdmin,
            id1,
            ManagementRole::Staff,
            id2
        ));
        assert!(can_suspend_reactivate_or_delete(
            ManagementRole::SuperAdmin,
            id1,
            ManagementRole::Admin,
            id2
        ));

        // Self-protection: SuperAdmin acting on self MUST FAIL
        assert!(!can_suspend_reactivate_or_delete(
            ManagementRole::SuperAdmin,
            id1,
            ManagementRole::SuperAdmin,
            id1
        ));

        // SuperAdmin acting on another SuperAdmin MUST FAIL
        assert!(!can_suspend_reactivate_or_delete(
            ManagementRole::SuperAdmin,
            id1,
            ManagementRole::SuperAdmin,
            id2
        ));

        // Admin acting on anyone MUST FAIL
        assert!(!can_suspend_reactivate_or_delete(
            ManagementRole::Admin,
            id1,
            ManagementRole::Staff,
            id2
        ));
        assert!(!can_suspend_reactivate_or_delete(
            ManagementRole::Admin,
            id1,
            ManagementRole::Admin,
            id2
        ));

        // Staff acting on anyone MUST FAIL
        assert!(!can_suspend_reactivate_or_delete(
            ManagementRole::Staff,
            id1,
            ManagementRole::Staff,
            id2
        ));
    }
}
