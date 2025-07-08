-- Liftify Database Schema for AWS RDS MySQL
-- Run this script to create the database tables

CREATE DATABASE IF NOT EXISTS liftify;
USE liftify;

-- Users table
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Workouts table
CREATE TABLE workouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, date),
    INDEX idx_user_created (user_id, created_at)
);

-- Sets table
CREATE TABLE sets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL,
    set_number INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    reps INT NOT NULL,
    power_belt BOOLEAN DEFAULT FALSE,
    butt_up BOOLEAN DEFAULT FALSE,
    assistance BOOLEAN DEFAULT FALSE,
    failed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
    INDEX idx_workout_set (workout_id, set_number),
    INDEX idx_workout_created (workout_id, created_at)
);

-- Indexes for performance
CREATE INDEX idx_workouts_user_date_desc ON workouts(user_id, date DESC);
CREATE INDEX idx_sets_workout_weight ON sets(workout_id, weight DESC);
CREATE INDEX idx_sets_weight_reps ON sets(weight, reps);