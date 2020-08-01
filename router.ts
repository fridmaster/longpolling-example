import { Express, Router } from 'express';
import { request } from 'http';

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
            // принять POST-запрос
            req.setEncoding('utf8');
            var message = '';
            req.on('data', function(chunk) {
            message += chunk;
            }).on('end', function() {
            this.publish(message); // собственно, отправка
            res.end("ok");
            });

            return;
        });
        this.router.get('/subscribe', (req, res)=>{
            this.onSubscribe(req, res);
            return;
        })
        this.app.use('/', this.router);
    }

    private onSubscribe(req, res) {
        const id = Math.random();
        let after = req.query.after;
        res.setHeader('Content-Type', 'text/plain;charset=utf-8');
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
        
        this.subscribers[id] = res;
        //console.log("новый клиент " + id + ", клиентов:" + Object.keys(subscribers).length);
        this.publish(`send after ${after}`, after);
        req.on('close', () => {
          delete this.subscribers[id];
          //console.log("клиент "+id+" отсоединился, клиентов:" + Object.keys(subscribers).length);
        });
      
      }

      private publish(message, timeout) {

        //console.log("есть сообщение, клиентов:" + Object.keys(subscribers).length);
      
        for (var id in this.subscribers) {
          //console.log("отсылаю сообщение " + id);
          const res = this.subscribers[id];

          setTimeout(()=>{res.end(message)},timeout);
        }
      
        this.subscribers = {};
      }  
}