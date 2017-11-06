const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require("fs");

exports.handler = (event, context, callback) => {
    const bucket = process.env.BUCKET;

    if (bucket && bucket !== '') {
        console.log(`Uploading badges to ${bucket}.`);

        const isPipeline = typeof event.detail.pipeline !== "undefined";
        const project = isPipeline ? event.detail.pipeline : event.detail['project-name'];
        const status = isPipeline ? event.detail.state : event.detail['build-status'];
        const image = `badges/${isPipeline ? 'pipeline' : 'build'}-${status}.svg`;
        const key = `${project}.svg`;

        console.log(`Build for project ${project} was a ${status} so uploading` +
            ` the image ${image} to s3://${bucket}/${key}`);

        const params = {
            Bucket: bucket,
            Key: key,
            Body: fs.readFileSync(image),
            ACL: 'public-read',
            ContentType: 'image/svg+xml'
        };

        s3.putObject(params, (err, data) => {
            if (err) {
                const message = `Failed to upload image to S3: ${err}`;
    
                console.error(message);
                callback(message, null);
            } else {
                const message = 'Upload complete!';

                console.log(message);
                callback(null, message);
            }
        });
    } else {
        callback('You must set the "BUCKET" environment variable to the name' +
            'of the bucket that your badges will be uploaded to.', null);
    }
};
