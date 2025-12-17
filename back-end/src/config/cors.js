require('dotenv').config();

const configCors = (app) => {
    //add header before the routes are defined
    app.use((req, res, next) => {
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', process.env.REACT_URL);

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

        //set to true if you need the website to include cookies in the requests sent
        //to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);

        // Handle preflight
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }

        //pass to next layer of middleware
        next();
    })
}

export default configCors;