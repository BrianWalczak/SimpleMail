# SimpleMail

> SimpleMail is a straightforward Node.js library that enables you to launch your own native incoming SMTP server, effortlessly.

## Getting Started

### Usage

To get started with launching your SMTP server, you'll need to initialize it and specify a port.
Additionally, you'll need to provide a callback function using the `catch()` method. This function will be invoked whenever a new email is received to your SMTP server.

```js
const SimpleMail = require('simple-mail');
const server = new SimpleMail();
const port = 25;

function myFunction(parsed) {
  console.log('Email from ' + parsed.from.text + '!');
}

server.catch(myFunction);

// Start your SMTP server at port 25 (default)
server.listen(port, (serverIP) => {
  console.log(`SMTP server started at ${serverIP}:${port}`)
  // other logic
});
```

After running this command, your SMTP server will successfully start at the specified port. All emails will automatically be parsed with simpleParser and your function will be invoked.

### DKIM Verification

By default, all emails received by your SMTP server will be automatically checked for DKIM verification. However, you may override this setting by using the `verifyDKIM()` function.

```js
server.verifyDKIM(false); // DANGER: All incoming emails will be passed through your SMTP server
```

By overriding this function, all incoming emails will not be scanned for valid DKIM verification, and will cause an invoke of your callback function.
**DANGER ZONE!**
