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

    this.router.get('/publish', (req, res) => {
      let after = req.query.after;
      req.setEncoding('utf8');
      var message = '';
      req.on('data', function (chunk) {
        message += chunk;
      }).on('end', () => { 
        this.publish(message, after, res); // собственно, отправка
      });
      return;
    });
    this.router.get('/subscribe', (req, res) => {
      this.onSubscribe(req, res);
      return;
    })

    this.router.get('/', (_req, res) => {
      res.sendFile(path.resolve(__dirname + '/index.html'));
    })
    this.app.use('/', this.router);
  }

  private onSubscribe(req, res) {
    const id = Math.random();
    res.setHeader('Content-Type', 'text/plain;charset=utf-8');
    res.setHeader("Cache-Control", "no-cache, must-revalidate");

    this.subscribers[id] = res;
    req.on('close', () => {
      delete this.subscribers[id];
    });

  }

  private publish(message, timeout, resOnPub) {
    resOnPub.send(JSON.stringify({ message: `timeout will be ${timeout}` }));
    for (var id in this.subscribers) {
      const res = this.subscribers[id];
      setTimeout(() => {

        res.end(message);
        
      }, timeout);
    }

    this.subscribers = {};
  }
}