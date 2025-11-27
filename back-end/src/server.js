import express from 'express';
import configViewEngine from './config/viewEngine';
import initeWebRoutes from './routes/web';
//repuire('dotenv').config();
import bodyParser from 'body-parser';
// import connection from './config/connectDB';

const app = express();
const PORT = process.env.PORT || 8080;

//config view engine
configViewEngine(app);

//body parser config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//connect to database
// connection();

//init web routes
initeWebRoutes(app);

app.listen(PORT, () => {
    console.log('>>> Server is running on port: ' + PORT);
});