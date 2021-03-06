const ClientError = require('../../exceptions/ClientError');
class UploadsHandler {
    constructor(service, validator, albumsService) {
        this._service = service;
        this._validator = validator;
        this._albumsService = albumsService;

        this.postUploadCoverHandler = this.postUploadCoverHandler.bind(this);

    }
    async postUploadCoverHandler(request, h) {
        try {
            const { cover } = request.payload;
            this._validator.validateImageHeaders(cover.hapi.headers);

            const filename = await this._service.writeFile(cover, cover.hapi);

            const { id } = request.params;

            const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`;

            await this._albumsService.addCoverAlbum(id, { coverUrl: fileLocation });

            const response = h.response({
                status: 'success',
                message: 'cover berhasil diunggah',
            }).code(201);

            return response;
        } catch (error) {
            if (error instanceof ClientError) {
                const response = h.response({
                    status: 'fail',
                    message: error.message,
                });
                response.code(error.statusCode);
                return response;
            }
            // Server ERROR!
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kegagalan pada server kami.',
            });
            response.code(500);
            console.error(error);
            return response;
        }
    }
}

module.exports = UploadsHandler