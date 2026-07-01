package models

type UserBackoffice struct {
	Email        string `gorm:"size:150;primaryKey;not null" json:"email"`
	PasswordHash string `gorm:"size:255;not null" json:"-"`
}

func (UserBackoffice) TableName() string {
	return "users_backoffice"
}

type SafeUserBackoffice struct {
	Email string `json:"email"`
}

func ToSafeUserBackoffice(u *UserBackoffice) SafeUserBackoffice {
	return SafeUserBackoffice{Email: u.Email}
}

func ToSafeUsersBackoffice(users []UserBackoffice) []SafeUserBackoffice {
	safe := make([]SafeUserBackoffice, 0, len(users))
	for i := range users {
		safe = append(safe, ToSafeUserBackoffice(&users[i]))
	}
	return safe
}

// Request structs

type CreateUserBackofficeRequest struct {
	Email       string            `json:"email"        binding:"required,email"`
	Password    string            `json:"password"     binding:"required,min=8"`
	Permissions []PermissionInput `json:"permissions,omitempty"`
}

type UpdateUserBackofficeRequest struct {
	Password string `json:"password" binding:"required,min=8"`
}

type LoginUserBackofficeRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

// Pagination/query structs

type UserBListQuery struct {
	Limit       int
	Offset      int
	SortBy      string
	SortOrder   string
	SearchBy    string
	SearchValue string
}

type UserBListResult struct {
	Users           []SafeUserBackoffice `json:"users"`
	TotalRecords    int64                `json:"total_records"`
	FilteredRecords int64                `json:"filtered_records"`
}
