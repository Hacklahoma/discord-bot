import { Server } from 'http';
import * as express from 'express';
import { Application } from 'express';
import { GuildMember } from 'discord.js';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { Bot } from '../Bot';

export class ExpressServer {
  private app: Application;
  private server: Server;
  private bot: Bot;
  private PORT: string = process.env.EXPRESS_PORT;
  private allowedOrgins = [
    'http://localhost:8080/',
    'https://register.hacklahoma.org',
    'http://localhost:8000/',
    'http://localhost:5432/'
  ];

  constructor(bot: Bot) {
    // Allows the server to use the Discord Bot
    this.bot = bot;

    // Create a new Express Application
    this.app = express();
    this.server = new Server(this.app);

    // Use helmet middleware
    this.app.use(helmet());

    // Use body parser middleware
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Use CORS middleware to allow access only from two domains
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (this.allowedOrgins.includes(origin)) {
            callback(null, true);
          } else {
            console.log(origin);
            callback(null, false);
          }
        },
      })
    );

    // Preflight
    this.app.options('*', cors());

    this.app.get('/', async (req, res) => {
      await this.bot.getMemberList().then((members) => {
        res.status(200);
        res.json(members.toJSON());
        res.end();
      });
    });

    this.app.get('/check_user/:discord_id', (req, res) => {
      res.status(200);
      const member: GuildMember = this.bot.getMember(req.params.discord_id);

      if (member) {
        res.json({ exists: true });
      } else {
        res.json({ exists: false });
      }
      res.end();
    });
  }

  /**
   * Listen on the designated port
   */
  listen(): void {
    this.server.listen(this.PORT, () => {
      console.log(`Express server running on port ${this.PORT}`);
    });
  }
}
