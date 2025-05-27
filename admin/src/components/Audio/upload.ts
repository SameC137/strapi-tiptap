const uploadMedia = async (file: File) => {
    const formData = new FormData();
    formData.append(`files`, file, file.name);
    return fetch('/api/upload', {
      method: 'post',
      body: formData

    }).then((response) => response.json()).then((response) => `${location.hostname}${response.data[0].url}`);
}

export default uploadMedia;