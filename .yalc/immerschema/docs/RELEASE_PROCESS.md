# Release Process Guide

This document outlines the process for publishing new subversions of the Immerschema package.

## Version Bumping Process

### 1. Update Version Numbers

Update the version number in all relevant files:

```bash
# Update these files:
- package.json
- pyproject.toml
- README.md (installation instructions)
- docs/CHANGELOG.md (add new version entry)
```

### 2. Git Commit Changes

```bash
# Stage the modified files
git add package.json pyproject.toml README.md docs/CHANGELOG.md

# Create a commit
git commit -m "chore: bump version to X.Y.Z"
```

### 3. Create and Push Git Tag

```bash
# Create an annotated tag
git tag -a vX.Y.Z -m "Release version X.Y.Z"

# Push the tag to GitHub
git push origin vX.Y.Z
```

## Version Numbering Convention

Follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

## Release Checklist

Before creating a new release:

1. [ ] All tests pass (`npm test`)
2. [ ] Documentation is up to date
3. [ ] CHANGELOG.md is updated
4. [ ] Version numbers are consistent across all files
5. [ ] Changes are committed and pushed
6. [ ] Git tag is created and pushed

## Automated Release Process

The repository uses GitHub Actions for automated releases. When a new tag is pushed:

1. GitHub Actions workflow is triggered
2. Tests are run
3. Package is built
4. Release is published to npm and PyPI

## Manual Release Steps (if needed)

If automated release fails, you can manually publish:

```bash
# For npm
npm publish

# For PyPI
python -m build
twine upload dist/*
```

## Troubleshooting

If you encounter issues during the release process:

1. Check GitHub Actions logs for automated release failures
2. Verify all version numbers are consistent
3. Ensure you have proper permissions for npm/PyPI publishing
4. Check if the tag was properly pushed to GitHub

## Best Practices

1. Always create releases from the `main` branch
2. Use annotated tags (`-a` flag) for better documentation
3. Include meaningful commit messages
4. Update CHANGELOG.md with all significant changes
5. Test the package locally before releasing

## Contact

If you encounter any issues during the release process, please:
1. Check the GitHub Issues
2. Contact the maintainers
3. Review the GitHub Actions logs

## Quick Cheat Sheet

### 1. Update Version Numbers
```bash
# Update in all files:
- package.json
- pyproject.toml
- README.md
- docs/CHANGELOG.md
```

### 2. Commit Changes
```bash
git add package.json pyproject.toml README.md docs/CHANGELOG.md
git commit -m "chore: bump version to X.Y.Z"
git push origin main
```

### 3. Create and Push Tag
```bash
git tag -a vX.Y.Z -m "Release version X.Y.Z"
git push origin vX.Y.Z
```

### 4. Monitor Build
1. Go to GitHub repository
2. Click "Actions" tab
3. Watch the workflow triggered by the tag
4. Check build logs for any issues

### Common Issues & Solutions

1. **Build Fails**
   - Check GitHub Actions logs
   - Verify all version numbers match
   - Ensure all files are committed

2. **Package Not Published**
   - Check npm/PyPI credentials in GitHub Secrets
   - Verify workflow permissions
   - Check for rate limiting

3. **Version Already Exists**
   - Increment version number
   - Delete local tag: `git tag -d vX.Y.Z`
   - Delete remote tag: `git push origin :vX.Y.Z`
   - Create new tag with incremented version 