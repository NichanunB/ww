-- Create Database
CREATE DATABASE IF NOT EXISTS novelsync CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE novelsync;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Character Diagram',
    description TEXT,
    cover_image TEXT,
    project_data JSON, -- Store the entire diagram data as JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Characters table (optional - for structured data)
CREATE TABLE characters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    element_id VARCHAR(50) NOT NULL, -- matches frontend element ID
    name VARCHAR(255),
    character_type ENUM('protagonist', 'antagonist', 'supporting', 'neutral') DEFAULT 'neutral',
    age VARCHAR(50),
    details TEXT,
    profile_image TEXT,
    position_x FLOAT,
    position_y FLOAT,
    color VARCHAR(7) DEFAULT '#000000',
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    UNIQUE KEY unique_element_project (project_id, element_id)
);

-- Relationships table (optional - for structured data)
CREATE TABLE relationships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NOT NULL,
    element_id VARCHAR(50) NOT NULL,
    source_character_id INT NOT NULL,
    target_character_id INT NOT NULL,
    relationship_type ENUM('generic', 'child-of') DEFAULT 'generic',
    label VARCHAR(255),
    color VARCHAR(7) DEFAULT '#1677ff',
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (source_character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (target_character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_project_id (project_id),
    UNIQUE KEY unique_element_project (project_id, element_id)
);

-- Sessions table (for JWT token management)
CREATE TABLE sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Insert sample data
INSERT INTO users (user_name, email, password_hash) VALUES
('John Doe', 'john@example.com', '$2a$10$rOyQZ8QqNEZjPz.KxKvDSOKGCGCqWqmNJ8GhCG8jjF3zCgCOKlOOm'), -- password: "password123"
('Jane Smith', 'jane@example.com', '$2a$10$rOyQZ8QqNEZjPz.KxKvDSOKGCGCqWqmNJ8GhCG8jjF3zCgCOKlOOm');

INSERT INTO projects (user_id, title, description, project_data) VALUES
(1, 'My Fantasy Novel Characters', 'Character relationships for my fantasy novel', '{"elements":[],"metadata":{"version":"1.0"}}'),
(1, 'Romance Story Diagram', 'Character web for romance story', '{"elements":[],"metadata":{"version":"1.0"}}'),
(2, 'Sci-Fi Character Map', 'Space opera character relationships', '{"elements":[],"metadata":{"version":"1.0"}}');