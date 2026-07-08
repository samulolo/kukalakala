

const passwordRegex = new RegExp("/^(?=.*[A-Z])(?=.*\d)(?=.*[a-z])(?=.*[@*#\.$%&]).{8,}/gm")



const verifyPassword = (password : string) => {
    return passwordRegex.test(password)
}

export {verifyPassword}