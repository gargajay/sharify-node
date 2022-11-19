/* -----------------------------------------------------------------------
   * @ description : This is the util controller layer.
----------------------------------------------------------------------- */

const UPLOAD_PATH = 'uploads/';

export const downloadFile = {
  directory: {
    path: UPLOAD_PATH,
    redirectToSlash: false,
    index: false
  }
};

export const uploadFile = async (request, h) => {
  //const { payload } = request;
  //const file = payload['file'];
};
