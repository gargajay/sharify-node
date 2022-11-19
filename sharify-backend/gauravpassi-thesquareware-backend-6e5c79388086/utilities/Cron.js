const cron = require('node-cron');
// const fs = require('fs');

const getFileFromFIleZiilaClient = async () => {
  try {
    var Client = require('ssh2').Client;
    var conn = new Client();
    conn
      .on('ready', function() {
        console.log('Client :: ready');
        conn.sftp(function(err, sftp) {
          if (err) throw err;
          sftp.readdir('/SanMarPDD', function(err, list) {
            if (err) throw err;
            console.dir(list);
            // fs.readFile(list.SanMar_EPDD.csv, (err, data) => {
            //   console.log(data);
            // })
            conn.end();
          });
        });
      })
      .connect({
        host: 'ftp.sanmar.com',
        user: '56404',
        password: 'Sanmar04',
        port: 2200
      });
  } catch (err) {
    console.log(err, 'error in getting products from CSV');
  }
};

//Function to get products daily after 24 hours
export const getProductsFromSANMARAPI = cron.schedule('* * * * *', async () => {
  //will run every 24 hours to get latest products and save in DB'
  console.log('getting latest products from SANMAR every 24 hours');
  // await getProductsFromSANMARService();
  await getFileFromFIleZiilaClient();
});
