#!/bin/bash

# Wildlife Database SQL Scripts Runner
# This script helps you execute the SQL setup scripts easily

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${PURPLE}🦁 $1${NC}"
}

# Show usage
show_usage() {
    echo "Wildlife Database SQL Scripts Runner"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  setup      - Run complete database setup (schema + seed data)"
    echo "  schema     - Create database schema only"
    echo "  seed       - Insert sample data only"
    echo "  reset      - Reset database (⚠️ DESTRUCTIVE - deletes all data)"
    echo "  test       - Test database connection"
    echo "  help       - Show this help message"
    echo ""
    echo "Options:"
    echo "  -d, --database DATABASE_NAME   Database name"
    echo "  -h, --host HOST                Database host (default: localhost)"
    echo "  -p, --port PORT                Database port (default: 5432)"
    echo "  -U, --username USERNAME        Database username"
    echo "  -f, --file FILE                Custom SQL file to execute"
    echo "  --url DATABASE_URL             Complete database connection URL"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL                   PostgreSQL connection string"
    echo "  PGDATABASE                     Database name"
    echo "  PGHOST                         Database host"
    echo "  PGPORT                         Database port"
    echo "  PGUSER                         Database username"
    echo "  PGPASSWORD                     Database password"
    echo ""
    echo "Examples:"
    echo "  $0 setup -d wildlife_db -U postgres"
    echo "  $0 schema --database=wildlife_production"
    echo "  $0 seed --url=postgresql://user:pass@localhost/db"
    echo "  DATABASE_URL=postgresql://... $0 setup"
}

# Parse command line arguments
parse_args() {
    COMMAND=""
    DB_NAME=""
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_USER=""
    DB_URL=""
    CUSTOM_FILE=""
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            setup|schema|seed|reset|test|help)
                COMMAND="$1"
                shift
                ;;
            -d|--database)
                DB_NAME="$2"
                shift 2
                ;;
            -h|--host)
                DB_HOST="$2"
                shift 2
                ;;
            -p|--port)
                DB_PORT="$2"
                shift 2
                ;;
            -U|--username)
                DB_USER="$2"
                shift 2
                ;;
            -f|--file)
                CUSTOM_FILE="$2"
                shift 2
                ;;
            --url)
                DB_URL="$2"
                shift 2
                ;;
            --database=*)
                DB_NAME="${1#*=}"
                shift
                ;;
            --host=*)
                DB_HOST="${1#*=}"
                shift
                ;;
            --port=*)
                DB_PORT="${1#*=}"
                shift
                ;;
            --username=*)
                DB_USER="${1#*=}"
                shift
                ;;
            --file=*)
                CUSTOM_FILE="${1#*=}"
                shift
                ;;
            --url=*)
                DB_URL="${1#*=}"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Default command
    if [[ -z "$COMMAND" ]]; then
        COMMAND="help"
    fi
}

# Build connection string
build_connection() {
    if [[ -n "$DB_URL" ]]; then
        CONNECTION="$DB_URL"
    elif [[ -n "$DATABASE_URL" ]]; then
        CONNECTION="$DATABASE_URL"
    else
        # Build from components
        CONNECTION=""
        
        # Use environment variables as fallbacks
        DB_NAME="${DB_NAME:-$PGDATABASE}"
        DB_HOST="${DB_HOST:-$PGHOST:-localhost}"
        DB_PORT="${DB_PORT:-$PGPORT:-5432}"
        DB_USER="${DB_USER:-$PGUSER:-$USER}"
        
        if [[ -z "$DB_NAME" ]]; then
            print_error "Database name is required. Use -d option or set PGDATABASE/DATABASE_URL"
            exit 1
        fi
        
        CONNECTION="-h $DB_HOST -p $DB_PORT -d $DB_NAME"
        if [[ -n "$DB_USER" ]]; then
            CONNECTION="$CONNECTION -U $DB_USER"
        fi
    fi
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    
    if [[ "$CONNECTION" == *"postgresql://"* ]] || [[ "$CONNECTION" == *"postgres://"* ]]; then
        psql "$CONNECTION" -c "SELECT version();" > /dev/null 2>&1
    else
        psql $CONNECTION -c "SELECT version();" > /dev/null 2>&1
    fi
    
    if [[ $? -eq 0 ]]; then
        print_status "Database connection successful!"
        return 0
    else
        print_error "Database connection failed!"
        return 1
    fi
}

# Execute SQL file
execute_sql() {
    local file="$1"
    local description="$2"
    
    if [[ ! -f "$file" ]]; then
        print_error "SQL file not found: $file"
        exit 1
    fi
    
    print_info "Executing $description..."
    print_info "File: $file"
    
    if [[ "$CONNECTION" == *"postgresql://"* ]] || [[ "$CONNECTION" == *"postgres://"* ]]; then
        psql "$CONNECTION" -f "$file"
    else
        psql $CONNECTION -f "$file"
    fi
    
    if [[ $? -eq 0 ]]; then
        print_status "$description completed successfully!"
    else
        print_error "$description failed!"
        exit 1
    fi
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Main execution
main() {
    print_header "Wildlife Database SQL Scripts Runner"
    echo "======================================"
    
    case $COMMAND in
        "help")
            show_usage
            ;;
        "test")
            build_connection
            test_connection
            ;;
        "setup")
            build_connection
            test_connection || exit 1
            print_info "Running complete database setup..."
            execute_sql "$SCRIPT_DIR/00-setup.sql" "Complete database setup"
            print_status "Database setup completed! 🎉"
            print_info "Default login: admin@wildlife.com / admin123"
            ;;
        "schema")
            build_connection
            test_connection || exit 1
            execute_sql "$SCRIPT_DIR/01-schema.sql" "Database schema creation"
            ;;
        "seed")
            build_connection
            test_connection || exit 1
            execute_sql "$SCRIPT_DIR/02-seed-data.sql" "Sample data insertion"
            ;;
        "reset")
            build_connection
            test_connection || exit 1
            print_warning "⚠️  WARNING: This will delete ALL data in the database!"
            print_warning "Are you sure you want to continue? (yes/no)"
            read -r confirmation
            if [[ "$confirmation" == "yes" ]]; then
                execute_sql "$SCRIPT_DIR/99-reset.sql" "Database reset"
                print_status "Database reset completed. You can now run 'setup' to recreate."
            else
                print_info "Reset cancelled."
            fi
            ;;
        "custom")
            if [[ -z "$CUSTOM_FILE" ]]; then
                print_error "Custom file not specified. Use -f option."
                exit 1
            fi
            build_connection
            test_connection || exit 1
            execute_sql "$CUSTOM_FILE" "Custom SQL file execution"
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

# Parse arguments and run main function
parse_args "$@"
main 