env "local" {
  # Database connection string
  url = "postgres://admin:admin123@localhost:5432/nest_db?search_path=public&sslmode=disable"
  
  # The schema file to use
  src = "file://schema.hcl"

  # Optional: Define dev database for checking migrations safely
  # dev = "docker://postgres/15/dev"
}
