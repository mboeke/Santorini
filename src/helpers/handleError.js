export const handleError = (response) => {
    if(response.status === 204) return {};
    return response.json()
        .then(json => {
            if (response.ok) {
                return json
            } else {
                return Promise.reject(Object.assign({}, json, {
                    status: json.status,
                    statusText: json.statusText
                }))
            }
        })
};