# PixelProxy API

Turns data into pixels so we can sneak API calls into things that only support video. Runs as a web service, includes K8 and Docker configs. Takes input as JSON, can output multiple encoding strategies to provide the data as either XML or JSON.

## Run Now (Docker)

`docker run -p 9999:9999 registry.gitlab.com/anfaux/pixel-proxy:latest`

## Testing / Running on the Command Line

There is a script (`test.js [INPUT FILE]` script in `server-node` directory) that will allow you to run the conversion once on canned data without needing to spin up the server. The artifacts will be put in TMP and left there for inspection. This is most useful for development work, suggest you run:

`nodemon test.js ./testdata.json --ignore TMP`

Configuration comes from a .env file (see below for options)

## Config

Use environment variables to establish default behavior. None of the options are required.
| Variable | |
| --------- | :--------------------------------------------------------------------------- |
| ENCODING_TYPE | Determines how the image is encoded, valid options are: `BINARY`, `NAIVE_COLOR` |
| WIDTH | In pixels. Either specify BOTH width and height or omit BOTH. If omitted, `auto` is used|
| HEIGHT | In pixels. Either specify BOTH width and height or omit BOTH. If omitted, `auto` is used|
| KEEP_ARTIFACTS | For debugging. If "true", api will not clean up after a request, leaving the BMP and MP4 files in a temp directory for inspection |
| PORT | Specify the port the service should run on, defaults to `9999`|
| AUTH_KEY | If provided, this becomes a required parameter when making an API call. By default proxy is insecure.|
| DATA_FORMAT | Default data format: `xml` or `json` |
| B64 | `true,false` Use base64 encoding (defaults true) |
| APPLY_COMPRESSION | `true,false` Default false. APPLY_COMPRESSION overrides B64 if true (zip always returns B64) |
| HELP_URL | Full URL to a help page (returned if you call API without required param). Default 400. |

## Usage

Base Endpoint: `/?url=[https://API_URL]`

| Parameter |                                                                              |
| --------- | :--------------------------------------------------------------------------- |
| url       | Full url (including protocol) to an API endpoint to proxy. Must return JSON. |
| auth      | Required for the proxy to work if AUTH_KEY is specified in .env              |
| rt        | Optional. Return type. Valid options: [`mp4`,`b64`,`bmp`,`json`,`xml`]       |
| df        | Optional. Data type. Valid options: [`json`,`xml`]                           |
| et        | Optional. Encoding type. Valid options: [`BINARY`,`NAIVE_COLOR`]             |
| b64       | Optional. B64 interim or not? Valid options: [`true`,`false`]                |
| zip       | Optional. Overrides B64 if true (zip always returns B64) [`true`,`false`]    |

### Examples

`http://127.0.0.1:9999/?auth=kEUa5AZED&url=https://random-data-api.com/api/address/random_address&rt=mp4`

`http://127.0.0.1:9999/?url=https://random-data-api.com/api/nation/random_nation&rt=bmp&df=json&et=BINARY`
