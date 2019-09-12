/**
 * Form Submit
 */

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

var sns = new AWS.SNS();
var dynamodb = new AWS.DynamoDB();

const submit = async (event, context) => {

  if (event['queryStringParameters'] && event['queryStringParameters']['error']) {
    let r = Math.random().toString(36).substring(7);
    throw new Error(`Random error ${r}`)
  }
  
  // Send a text message with SNS
  const messageParams = {
    Message: 'Hello! Someone has submitted your form!',
    PhoneNumber: process.env.PHONE_NUMBER
  }
  await sns.publish(messageParams).promise()
  console.log('SMS message sent')

  // // Send items to DynamoDB
  // try {
  //   const dynamoParams = {
  //     Item: {
  //       "email": { S: "fernando@serverless.com" }, 
  //     }, 
  //     ReturnConsumedCapacity: "TOTAL", 
  //     TableName: "emailTable"
  //   };
  //   const putData = await dynamodb.putItem(dynamoParams).promise()
  //   console.log('Put the item in DynamoDB')
  // } catch (e) {
  //   console.log(e, e.stack)
  // }

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ message: 'form submission received' }),
  }

  return response
}

module.exports = { submit }
