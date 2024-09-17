
export const validateInputs = ({ username, password, confirmPassword = '', isRegistering = false }) => {
    if (!username) {
        return 'Username is required.';
    }
    if (username.length < 5) {
        return 'Username must be at least 5 characters long.';
    }
    if (/[^a-zA-Z0-9]/.test(username)) {
        return 'Username can only contain letters and numbers.';
    }
    if (!password) {
        return 'Password is required.';
    }
    if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[.-_!@#$%^&/°|?¿+:*]/.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, in that order.';
    }
    if (isRegistering && password !== confirmPassword) {
        return 'Passwords do not match. Please try again.';
    }
    return null;
};