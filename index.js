const { SMTPServer } = require('smtp-server');
const { simpleParser } = require('mailparser');
const dkim = require('dkim');

class SimpleMail {
  constructor() {
    this.server = new SMTPServer({
      authOptional: true,
      onData: this.onData.bind(this),
    });
    this.emailHandler = null;
		this.verifyDKIMFlag = true;
  }

  async onData(stream, session, callback) {
    let email = '';
    stream.on('data', (chunk) => {
      email += chunk.toString();
    });

		stream.on('end', async () => {
			try {
				const parsed = await simpleParser(email);
				
				if (this.verifyDKIMFlag) {
					const dkimVerified = await this.verifyDKIMFunc(email);
					if (dkimVerified) {
						this.handleEmail(parsed);
					}
				} else {
					this.handleEmail(parsed);
				}
			} catch (err) {
				console.error(err);
			} finally {
				callback();
			}
		});
  }

  verifyDKIMFunc(email) {
    return new Promise((resolve, reject) => {
      const modifiedEmail = email.replace(/darn=[^;]+;/g, ''); // Gmail is stupid and includes a "darn" field which isn't readable...
      const emailBuffer = Buffer.from(modifiedEmail, 'utf-8');
      let dkimVerified = false;

      try {
        dkim.verify(emailBuffer, (err, dkimResults) => {
          if (err) {
            return reject(err);
          }

          if (dkimResults && dkimResults.length > 0) {
            dkimResults.forEach(result => {
              if (result.verified && result.status === 'OK') {
                dkimVerified = true;
              }
            });
          }

          resolve(dkimVerified);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }
	
	handleEmail(parsedEmail) {
		if (this.emailHandler) {
			this.emailHandler(parsedEmail);
		}
	}

  catch(handler) {
    this.emailHandler = handler;
  }
	
	verifyDKIM(handler) {
		this.verifyDKIMFlag = handler;
	}

  listen(port, callback) {
    this.server.listen(port, '0.0.0.0', () => {
      const serverIP = this.server.server.address().address;
      callback(serverIP);
    });
  }
}

module.exports = SimpleMail;