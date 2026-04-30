
# Function to bump semantic version
# Usage: semver_bump "1.0.0" "patch"
semver_bump() {
  local current_version="${1}"
  local bump_type="${2}"

  if [ -z "${current_version}" ]; then
    current_version="0.0.0"
  fi

  # Split version into components
  IFS='.' read -r -a VERSION_PARTS <<< "${current_version}"
  local major="${VERSION_PARTS[0]}"
  local minor="${VERSION_PARTS[1]}"
  local patch="${VERSION_PARTS[2]}"

  # Bump version based on argument
  case "${bump_type}" in
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    patch)
      patch=$((patch + 1))
      ;;
    *)
      cat <<EOF >&2

Error: invalid bump type '${bump_type}'. 
Must be 'patch', 'minor', or 'major'.

EOF
      return 1
      ;;
  esac

  echo "${major}.${minor}.${patch}"
}
