import { Server } from 'http';
import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { Bot } from '../Bot';

export class ExpressServer {
  private app: Application;
  private server: Server;
  private bot: Bot;
  private PORT: string = process.env.PORT;
  private allowedOrgins = [
    'http://localhost:8080/',
    'https://register.hacklahoma.org',
    'http://localhost:8000/',
    'http://localhost:5432/',
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
            if (origin) {
              console.warn(`The origin '${origin}' is not allowed`);
            }
            callback(null, false);
          }
        },
      })
    );

    // Preflight
    this.app.options('*', cors());

    /*this.app.get('/', async (req, res) => {
      await this.bot.getMemberList().then((members) => {
        res.status(200);
        res.json(members.toJSON());
        res.end();
      });
    });*/

    /**
     * put request to check in the user. Requires discord_id, name, and team_name in the body
     */
    this.app.put('/check_in', async (req, res) => {
      await this.bot
        .checkMemberIn(req.body.discord_id, req.body.name, req.body.team_name)
        .then((members) => {
          res.status(200);

          const member = members.find(
            (member) => member.user.id === req.params.discord_id
          );
          if (member && member.roles.cache.has('725846354223693895')) {
            res.json({ success: true });
          } else {
            res.json({ success: false });
          }
          res.end();
        });
    });

    /**
     * Check to see if the user exists in the server
     */
    this.app.get('/check_user/:discord_id', async (req, res) => {
      await this.bot.getMemberList().then((members) => {
        res.status(200);

        if (
          members.find((member) => member.user.id === req.params.discord_id)
        ) {
          res.json({ exists: true });
        } else {
          res.json({ exists: false });
        }

        res.end();
      });
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
