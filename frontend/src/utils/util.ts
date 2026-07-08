

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])(?=.*[@*#\.$%&]).{8,}/m;

const verifyPassword = (password: string) => {
    return passwordRegex.test(password);
}

export { verifyPassword };