package services

import (
    "database/sql"
    "errors"
    "fmt"
    "backend/internal/config"
    "backend/internal/models"
    "time"

    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
)

type AuthService struct {
    db     *sql.DB
    config *config.Config
}

type Claims struct {
    UserID int `json:"user_id"`
    jwt.RegisteredClaims
}

func NewAuthService(db *sql.DB, cfg *config.Config) *AuthService {
    return &AuthService{
        db:     db,
        config: cfg,
    }
}

func (s *AuthService) Register(req models.RegisterRequest) (*models.User, error) {
    // Check if user already exists
    var existingUser models.User
    err := s.db.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&existingUser.ID)
    if err == nil {
        return nil, errors.New("user already exists with this email")
    }
    if err != sql.ErrNoRows {
        return nil, fmt.Errorf("error checking existing user: %w", err)
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
    if err != nil {
        return nil, fmt.Errorf("error hashing password: %w", err)
    }

    // Insert new user
    result, err := s.db.Exec(`
        INSERT INTO users (user_name, email, password_hash) 
        VALUES (?, ?, ?)
    `, req.UserName, req.Email, string(hashedPassword))
    if err != nil {
        return nil, fmt.Errorf("error creating user: %w", err)
    }

    userID, err := result.LastInsertId()
    if err != nil {
        return nil, fmt.Errorf("error getting user ID: %w", err)
    }

    // Get the created user
    user, err := s.GetUserByID(int(userID))
    if err != nil {
        return nil, fmt.Errorf("error retrieving created user: %w", err)
    }

    return user, nil
}

func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
    var user models.User
    err := s.db.QueryRow(`
        SELECT id, user_name, email, password_hash 
        FROM users 
        WHERE email = ?
    `, req.Email).Scan(&user.ID, &user.UserName, &user.Email, &user.PasswordHash)
    
    if err == sql.ErrNoRows {
        return nil, errors.New("invalid email or password")
    }
    if err != nil {
        return nil, fmt.Errorf("error finding user: %w", err)
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
        return nil, errors.New("invalid email or password")
    }

    // Generate JWT token
    token, err := s.GenerateToken(user.ID)
    if err != nil {
        return nil, fmt.Errorf("error generating token: %w", err)
    }

    return &models.LoginResponse{
        Token:   token,
        UserID:  user.ID,
        Message: "Login successful",
    }, nil
}

func (s *AuthService) GenerateToken(userID int) (string, error) {
    claims := Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(s.config.Session.Duration)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            NotBefore: jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(s.config.JWT.Secret))
}

func (s *AuthService) ValidateToken(tokenString string) (int, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(s.config.JWT.Secret), nil
    })

    if err != nil {
        return 0, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims.UserID, nil
    }

    return 0, errors.New("invalid token")
}

func (s *AuthService) GetUserByID(id int) (*models.User, error) {
    var user models.User
    err := s.db.QueryRow(`
        SELECT id, user_name, email, profile_image, created_at, updated_at 
        FROM users 
        WHERE id = ?
    `, id).Scan(
        &user.ID, 
        &user.UserName, 
        &user.Email, 
        &user.ProfileImage, 
        &user.CreatedAt, 
        &user.UpdatedAt,
    )

    if err == sql.ErrNoRows {
        return nil, errors.New("user not found")
    }
    if err != nil {
        return nil, fmt.Errorf("error finding user: %w", err)
    }

    return &user, nil
}

func (s *AuthService) GetUserProfile(id int) (*models.UserProfile, error) {
    var profile models.UserProfile
    err := s.db.QueryRow(`
        SELECT id, user_name, email, profile_image 
        FROM users 
        WHERE id = ?
    `, id).Scan(&profile.ID, &profile.UserName, &profile.Email, &profile.ProfileImage)

    if err == sql.ErrNoRows {
        return nil, errors.New("user not found")
    }
    if err != nil {
        return nil, fmt.Errorf("error finding user profile: %w", err)
    }

    return &profile, nil
}

func (s *AuthService) UpdateProfile(userID int, req models.UpdateProfileRequest) (*models.UserProfile, error) {
    // Build dynamic query based on provided fields
    setParts := []string{}
    args := []interface{}{}

    if req.UserName != nil {
        setParts = append(setParts, "user_name = ?")
        args = append(args, *req.UserName)
    }

    if req.ProfileImage != nil {
        setParts = append(setParts, "profile_image = ?")
        args = append(args, *req.ProfileImage)
    }

    if len(setParts) == 0 {
        return s.GetUserProfile(userID)
    }

    // Add updated_at
    setParts = append(setParts, "updated_at = NOW()")
    args = append(args, userID)

    query := fmt.Sprintf("UPDATE users SET %s WHERE id = ?", 
        fmt.Sprintf("%s", setParts[0]))
    for i := 1; i < len(setParts); i++ {
        query = fmt.Sprintf("%s, %s", query, setParts[i])
    }

    _, err := s.db.Exec(query, args...)
    if err != nil {
        return nil, fmt.Errorf("error updating profile: %w", err)
    }

    return s.GetUserProfile(userID)
}