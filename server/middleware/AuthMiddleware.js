import jwt from "jsonwebtoken";

export  const verifyToken = (request, response, next) => {
    const token = request.cookies.jwt;
    if(!token) return response.status(401).send('you are not authorized');
    jwt.verify(token, process.env.JWT_KEY, async(error, payload) => {
        if(error) return response.status(403).send('your token is invalid');
        request.userID = payload.userID;
        let test = request.userID;
        next();
    })
}