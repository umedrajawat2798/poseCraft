
# PoseCraft

In this project a user can upload a picture or upload multiple image urls in the page. The page will have multiple views of each image like zoom view, length view, neck view etc.

The project is divided into segments.
 1. Frontend - this contains an upload and insert option for the user. Perform image validity and url validity or else throw an error snackbar. Its uses React-table to display all uploaded images, status and their corresponding view. The update happens in rel time. 2 methods can be used to achieve this 1. polling 2. websocket. I have used polling.

 2. Backend - The backend receives the request in the form of a list of urls or an image file. If its an image file then its uploaded to s3 and a link is generated similar to image url.The url is a unique parameter so first we check if we already have the data or not. if not then we insert the url into mongo and then push to the task queue which runs independently. The task queue internally accesses the job and performs operations to generate multiple poses using tensorflow and sharp library and the generated image is uploaded to s3 which returns the urls and stored in mongo as shots.


## Techstack
 - React.js
 - Node.js
 - AWS S3
 - AWS EC2
 - Redis
 - nginx
 - MongoDb
 - Vercel

## Demo - https://www.loom.com/share/6329fd0955be4e439e9e4dc598ab6fed?sid=e5417c5f-fb5b-4780-9b6f-7366d28f6d17

## Website - https://pose-craft.vercel.app/

## Backend - https://posecraft-api.shop/

## Commands
   ### Frontend
   #### Development
     npm i 
     npm run start

   #### Production
     npm i
     npm run build
     serve -s build

   ### Backend
    npm i
    npm run dev // to start express server
    node worker.js // to start the worker file for processing tasks in queue

    NOte : Check if your redis is up and running


## Endpoints

/process - to process single image file upload. Returns id of the process and status

/process-batch - to process multiple image urls. Returns list of ids of the processes and status.

/image-status/:id - to fetch status of each id along with their different shots


## Database

Database used is mongo. 

   ### Schema
        {
            _id: number, // unique
        url: String, // unique
        status: { type: String, enum: ['pending', 'processed', 'failed'], default: 'pending' },
        shots: [
            {
            label: String,
            url: String,
            },
        ],
        }

## Task queue
  - Uses Bull library which works with redis to enter job into queue and remove post processing

        const Bull = require('bull');
        require('dotenv').config();
    
        const imageQueue = new Bull('image-processing', {
        redis: {
            host: process.env.REDIS_HOST || "127.0.0.1",
            port: process.env.REDIS_PORT || 6379,
        },
        defaultJobOptions: {
            removeOnComplete: true, // Automatically remove completed jobs
            removeOnFail: true      // Optionally, automatically remove failed jobs
        }
        });
    
        imageQueue.isReady().then(()=>{
        console.log("bull connected")
        }).catch((err)=> {
        console.log("error in bull", err)
        })

        module.exports = imageQueue;


  

## Error Handling
  if api fails error is sent to ui which is displayed as snackbar.
  Invalid url check in ui, displays error as snackbar with the invalid url.
  Image validity check in backend.
  Duplicate urls will not be re processed.

## Deployement
   ### Frontend
      integrated with vercel to host the website and also enable CI/CD pipeline.
   ### Backend
      deployed on AWS EC2 instance to run node.js server using pm2.
      Used elastic Ip from AWS and attached to domain bought on www.godaddy.com and setted proxy using nginx and enabled https security using SSL certificate generated using cert.
  
## Resources
- https://github.com/OptimalBits/bull
- https://www.tensorflow.org/js/tutorials/setup
- https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/
- https://search.app/2GtMSzD9QgNXw5wB9
- https://medium.com/@sharathholmes143/efficiently-manage-your-applications-with-pm2-in-background-790a29fff5e3
- https://gist.github.com/piyushgarg-dev/8b14c87c8ff4d626ecbc747b6b9fc57f






