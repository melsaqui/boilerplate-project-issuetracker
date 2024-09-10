'use strict';
require('dotenv').config();
const myDB = require('../connection');
const { ObjectId } = require('mongodb').ObjectId;
var mongoose = require("mongoose");
const BSON = require('bson');

module.exports = function (app) {
  //const date = new Date();

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      myDB(async client => {
        const myDataBase = await client.db('IssueTracker-QA-freeCodeCamp').collection(project);
        
        var data;
        var query={};
        let q;
        //data = await myDataBase.find().toArray();
      
        {
          let key;
          for(key in req.query){
            q =req.query[key];
            if (key=='open')
              q= Boolean(q)
            if (key == '_id')
              q= new ObjectId(q)

            query[key]=q

          }
          data = await myDataBase.find(query).toArray()
        }
        /*
        else{
         data = data.filter(function (item) {
          return Object.keys(req.query).every(function (key) {
            let q =req.query[key];
            if (key=='open')
              q= Boolean(req.query[key])
            if (key == '_id')
              q= new BSON.ObjectId(req.query[key])
              return item[key] == q;
          });
        });
        }*/

        return res.json(data)

      })
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let date = new Date().toJSON();
 

      if((req.body.created_by =='' || req.body.issue_text =='' || req.body.issue_title=='')||(req.body.created_by ==undefined || req.body.issue_text ==undefined || req.body.issue_title==undefined)){
        return res.json( {'error': 'required field(s) missing'} );
        
      }
      else{
        myDB(async client => {
          const myDataBase = await client.db('IssueTracker-QA-freeCodeCamp').collection(project);
          var assto;
          var stattext;
          if (req.body.assigned_to==null || req.body.assigned_to==undefined ||req.body.assigned_to=='')
            assto = ''
          else
            assto=req.body.assigned_to;
          if(req.body.status_text==null || req.body.status_text ==undefined || req.body.status_text =='')
            stattext=''
          else
            stattext=req.body.status_text;

          myDataBase.insertOne({
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_on: date,
            updated_on: date,
            created_by: req.body.created_by,
            assigned_to: assto,
            open:true,
            status_text : stattext

               
          });
          return res.json ( await myDataBase.findOne({}, {sort:{$natural:-1}}))
        
        })
      }
     
    })
    
    .put(function (req, res){
      let project = req.params.project;      
      try{
        if (req.body._id=='' || req.body._id==undefined || req.body._id==null) {
          return res.json({ error: 'missing _id' });
        }
        else if (!(mongoose.isValidObjectId(req.body._id))){
          return res.json({ error: 'invalid _id' });
        }
        else{
          let id= new BSON.ObjectId(req.body._id)

          myDB(async client => {
            const myDataBase = await client.db('IssueTracker-QA-freeCodeCamp').collection(project);
              let queries={}
              let date = new Date().toJSON();
              try{
                
                  if((req.body.issue_title=='' && req.body.issue_text=='' && 
                    req.body.created_by=='' && req.body.assigned_to =='' && req.body.status_text =='')||
                    (req.body.issue_title==undefined && req.body.issue_text==undefined && 
                      req.body.created_by==undefined && req.body.assigned_to ==undefined && req.body.status_text ==undefined)){
                      return res.json(
                        { error: 'no update field(s) sent', '_id': req.body._id });
                      
                  }
                  else{
                    queries['open']=(!Boolean(req.body.open))
                    queries['updated_on'] = date
                    if(req.body.issue_title!='')
                      queries['issue_title'] =req.body.issue_title
                    if(req.body.issue_text!='')
                      queries['issue_text'] =req.body.issue_text
                    if(req.body.issue_text!='')
                      queries['created_by'] =req.body.created_by
                    if(req.body.issue_text!='')
                      queries['assigned_to'] = req.body.assigned_to
                    if(req.body.issue_text!='')
                      queries['status_text '] =req.body.status_text 
                    //console.log(queries)
                    var upd= await myDataBase.updateOne({_id:id}, {$set:queries});
                      
                    //console.log(upd)
                    if(upd['modifiedCount']>0 && upd['acknowledged'])
                      return res.json({result: 'successfully updated', '_id': req.body._id})
                    else
                      return res.json({ error: "could not update", '_id' :req.body._id })
                  }
                
                 
              }catch (e){
                console.log(e)
                return res.json({ error: "could not update", '_id' :req.body._id })
              }      
            
          })
        }
      }catch (e){  
        return res.json({ error: "could not update", '_id' :req.body._id })
        
      }
      //return res.json({ error: "could not update", '_id' :req.body._id })
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      try{
        if (req.body._id=='' || req.body._id==undefined || req.body._id==null) 
          return res.json({ error: 'missing _id' });
        else if (!(mongoose.isValidObjectId(req.body._id))){
          return res.json({ error: 'invalid _id' });

        }
        else{
          let id=   new BSON.ObjectId(req.body._id)
          myDB(async client => {
            const myDataBase = await client.db('IssueTracker-QA-freeCodeCamp').collection(project);
  
            var del= await myDataBase.deleteOne({_id:id});
            //console.log(del)
            if(del!=undefined&&del['acknowledged'] && del['deletedCount'] >0  )
              return res.json({ 'result': 'successfully deleted', '_id': id })
  
            else{
              return res.json({'error': 'could not delete', '_id': id })
            }
          })
        } 
      }catch{
        return res.json({'error': 'could not delete', '_id': id })
      }
      
  });
    
};
