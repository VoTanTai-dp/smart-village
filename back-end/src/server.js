import express from 'express';
import configViewEngine from './config/viewEngine';
import configCors from './config/cors';
import initeWebRoutes from './routes/web';
//repuire('dotenv').config();
import bodyParser from 'body-parser';
// import connection from './config/connectDB';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import initApiRoutes from './routes/api';
import expressWs from 'express-ws';

const app = express();
const PORT = process.env.PORT || 8080;

//config express-ws
expressWs(app);

//config cors
configCors(app);

//config view engine
configViewEngine(app);

//body parser config
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//init api routes
initApiRoutes(app);

//connect to database
// connection();

//init web routes
initeWebRoutes(app);

app.listen(PORT, () => {
    console.log('>>> Server is running on port: ' + PORT);
});