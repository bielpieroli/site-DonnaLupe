package models

type PermissionLevel string

const (
	PermNone  PermissionLevel = "none"
	PermRead  PermissionLevel = "read"
	PermWrite PermissionLevel = "write"
)

var levelOrder = map[PermissionLevel]int{
	PermNone:  0,
	PermRead:  1,
	PermWrite: 2,
}

// HasLevel returns true when actual satisfies the required minimum level.
func HasLevel(actual, required PermissionLevel) bool {
	return levelOrder[actual] >= levelOrder[required]
}

// KnownResources lists the backoffice sections that permissions apply to.
// Add a new entry here whenever a new section is added to the backoffice.
var KnownResources = []string{
	"users",
	"products",
	"content",
	"permissions",
	"freight",
	"orders",
	"ingredients",
}

type Permission struct {
	BackofficeEmail string          `gorm:"column:backoffice_email;primaryKey;not null" json:"backoffice_email"`
	Resource        string          `gorm:"primaryKey;not null"                         json:"resource"`
	Level           PermissionLevel `gorm:"not null"                                    json:"level"`
}

func (Permission) TableName() string {
	return "permissions"
}

type PermissionInput struct {
	Resource string          `json:"resource" binding:"required"`
	Level    PermissionLevel `json:"level"    binding:"required"`
}

type SetPermissionsRequest struct {
	Permissions []PermissionInput `json:"permissions" binding:"required"`
}
