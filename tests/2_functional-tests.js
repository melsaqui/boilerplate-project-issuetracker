const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
require('dotenv').config();
const myDB = require('../connection');
chai.use(chaiHttp);
let output;
  myDB(async client => {
    const myDataBase = await client.db('IssueTracker-QA-freeCodeCamp').collection('func_test');
    output =(await myDataBase.findOne({}, {sort:{$natural:-1}}));
 
    
  });
  

suite('Functional Tests', function() {
    suite('POST Requests',function(){
        test('All Fields', function (done) {
            chai
              .request(server)
              .keepOpen()
              .post('/api/issues/func_test/')
              .send({'created_by':'melanie aqui', 'issue_text':'track issues','issue_title':'tracker','assigned_to':'Joe', 'status_text':'dev'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.created_by,'melanie aqui');
                assert.equal(res.body.issue_text,'track issues');
                assert.equal(res.body.issue_title,'tracker');
                assert.equal(res.body.assigned_to,'Joe');
                assert.equal(res.body.status_text,'dev');
    
                done();
              });
        });
        test('Only Required', function (done) {
            chai
              .request(server)
              .keepOpen()
              .post('/api/issues/func_test/')
              .send({'created_by':'melanie aqui', 'issue_text':'dude so many bugs','issue_title':'tracker bug'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.created_by,'melanie aqui');
                assert.equal(res.body.issue_text,'dude so many bugs');
                assert.equal(res.body.issue_title,'tracker bug');
    
                done();
              });
        }).timeout(10000);
        test('Missing Required Fields', function (done) {
            chai
              .request(server)
              .keepOpen()
              .post('/api/issues/func_test/')
              .send({'created_by':'me'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.error,'required field(s) missing');
    
                done();
              });
        });
    })

    suite('GET Requests',function(){
        test('No Filter', function (done) {
            chai
              .request(server)
              .keepOpen()
              .get('/api/issues/func_test/')
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                done();
              });
        });
        test('One Filter', function (done) {
            chai
              .request(server)
              .keepOpen()
              .get('/api/issues/func_test/?assigned_to=joe/')
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                done();
              });
        });
        test('Multiple Filter', function (done) {
            chai
              .request(server)
              .keepOpen()
              .get('/api/issues/func_test/?assigned_to=joe&open=true&issue_title=tracker/')
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
               // assert.equal(res.body.assigned_to,'joe')
                done();
              })
        }).timeout(10000);

    });

    suite('PUT Requests',function(){
        test('One Field', function (done) {
            chai
              .request(server)
              .keepOpen()
              .put('/api/issues/func_test/')
              .send({_id: output['_id'],issue_title: 'updated title'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.result,'successfully updated',"result should be a success");
                assert.equal(res.body._id,output['_id'],'id is incorrect or undefined');

                done();
              });
        });
        test('Many Fields', function (done) {
            chai
              .request(server)
              .keepOpen()
              .put('/api/issues/func_test/')
              .send({_id: output['_id'],issue_title: 'updated title2',assigned_to:'finn'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.result,'successfully updated',"result should be a success");
                assert.equal(res.body._id,output['_id'],'id is incorrect or undefined');

                done();
              });
        })
        test('Missing _id', function (done) {
            chai
              .request(server)
              .keepOpen()
              .put('/api/issues/func_test/')
              .send({_id: '',issue_title: 'updated title3',assigned_to:'finne'})
              .end(async function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.error,'missing _id');

                done();
              });
        });

        test('No fields Updated', function (done) {
          chai
            .request(server)
            .keepOpen()
            .put('/api/issues/func_test/')
            .send({_id: output['_id']})
            .end(async function (err, res) {
              assert.equal(res.status, 200);
              assert.equal(res.type,'application/json','Response should be json', );
              assert.equal(res.body.error,'no update field(s) sent');
              assert.equal(res.body._id,output['_id'],'id is incorrect or undefined');

              done();
            });
      })

        test('Invalid _id', function (done) {
            chai
              .request(server)
              .keepOpen()
              .put('/api/issues/func_test/')
              .send({_id:'12rers'})
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.error,'invalid _id')
                done();
              });
        });
    });

    suite('DELETE Requests',function(){
        test('Delete an issue', function (done) {
        
          console.log();
            chai
              .request(server)
              .keepOpen()
              .delete('/api/issues/func_test/')
              .send({_id: output['_id']})
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.result,'successfully deleted');
                done();
              });
        });
        test('Invalid _id', function (done) {
            chai
              .request(server)
              .keepOpen()
              .delete('/api/issues/func_test/')
              .send({_id:'12s'})
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.error,'invalid _id')
                done();
              });
        });
        test('Missing _id', function (done) {
            chai
              .request(server)
              .keepOpen()
              .delete('/api/issues/func_test/')
              .send({_id:''})
              .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.type,'application/json','Response should be json', );
                assert.equal(res.body.error,'missing _id')
                done();
              });
        });
    });
    
});
