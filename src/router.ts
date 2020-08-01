import { Express, Router } from 'express';
import * as path from 'path';

export default class AppRouter {
    public router;
    private app;
    private subscribers = {};
    constructor(app: Express) {
        this.router = Router();
        this.app = app;

    }

    public init(): void {
        this.router.get('/', (req, res) => {
            console.log('we got it here', req.body);
            res.send('WE SEND IT BACk')
        });
        this.router.post('/publish', (req, res)=>{
             let after = req.query.after;
            after = 3000;
            // принять POST-запрос
            req.setEncoding('utf8');
            var message = '';
            req.on('data', function(chunk) {
            message += chunk;
            }).on('end', () => {
              this.publish(message, after, res); // собственно, отправка
            });

            return;
        });
        this.router.get('/subscribe', (req, res)=>{
            this.onSubscribe(req, res);
            return;
        })

        this.router.get('/chat', (_req, res)=> {

          console.log(path.join(__dirname + '/index.html'));
          res.sendFile(path.resolve(__dirname + '/index.html'));
          // next();
        })
        this.app.use('/', this.router);
    }

    private onSubscribe(req, res) {
        const id = Math.random();
        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
        
        this.subscribers[id] = res;
        //console.log("новый клиент " + id + ", клиентов:" + Object.keys(subscribers).length);
        req.on('close', () => {
          delete this.subscribers[id];
          //console.log("клиент "+id+" отсоединился, клиентов:" + Object.keys(subscribers).length);
        });
      
      }

      private publish(message, timeout, resOnPub) {

        //console.log("есть сообщение, клиентов:" + Object.keys(subscribers).length);
        resOnPub.send(JSON.stringify({message:`timeout will be ${timeout}`}));
        for (var id in this.subscribers) {
          //console.log("отсылаю сообщение " + id);
          const res = this.subscribers[id];
          setTimeout(()=>{
            res.end(message);
            res
          },timeout);
        }
      
        this.subscribers = {};
      }  
}