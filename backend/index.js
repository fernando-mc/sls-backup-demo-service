/**
 * Form Submit
 */

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var sns = new AWS.SNS();
var dynamodb = new AWS.DynamoDB();

const submit = async (event, context, callback) => {

  if (event['queryStringParameters'] && event['queryStringParameters']['error']) {
    let r = Math.random().toString(36).substring(7);
    throw new Error(`Random error ${r}`)
  }

  // Make some HTTP(S) request.
  try {
    const https = require('https');
    const url = 'https://pokeapi.co/api/v2/pokemon/ditto/'

    const getData = await https.get(url, res => {
      res.setEncoding()
      let data = ''
    
      res.on('data', (chunk) => {
        data += chunk
      });
      res.on('end', () => {
        ability = JSON.parse(data)["abilities"][0]["ability"]["name"]
        console.log("First Ability of the Pokemon: " + ability)
      });
    }).on('error', (e) => {
      console.error(e);
    });
  } catch (e) {
    console.log(e, e.stack)
  }
  
  
  // Send a text message with SNS
  try {
    const messageParams = {
      Message: 'This should be in a span?',
      PhoneNumber: '+15412076854'
    }
    await sns.publish(messageParams).promise()
    console.log('SMS message sent')
  } catch (e) {
    console.log(e, e.stack)
  }

  // Create SNS Topic
  let createData
  try {
    const params = {
      Name: 'demo-email-form-snstopic-' + Math.random().toString(36).substring(7)
    }
    createData = await sns.createTopic(params).promise()
  } catch (e) {
    console.log(e, e.stack)
  }

  // Delete Topic
  try {
    const deleteParams = {
      TopicArn: createData.TopicArn
    }
    const deleteData = await sns.deleteTopic(deleteParams).promise()
    console.log('Topic deleted');
  } catch (e) {
    console.log(e, e.stack)
  }

  // Send items to DynamoDB
  try {
    const dynamoParams = {
      Item: {
        "email": { S: "fernando@serverless.com" }, 
      }, 
      ReturnConsumedCapacity: "TOTAL", 
      TableName: "emailTable"
    };
    const putData = await dynamodb.putItem(dynamoParams).promise()
    console.log('Put the item in DynamoDB')
  } catch (e) {
    console.log(e, e.stack)
  }

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
