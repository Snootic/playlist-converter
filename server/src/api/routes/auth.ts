import { Auth } from '@/services/auth';
import { AuthConfig } from '@types';
import { Request, Response, Router } from 'express';
import { getConfig } from '../../utils/detectSource';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const redirectUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : null;
  const platform = typeof req.query.platform === 'string' ? req.query.platform : null;

  if (redirectUri === null) {
    throw new Error("The redirect uri must be provided")
  }

  if (platform === null) {
    throw new Error("The platform must be specified")
  }

  const config: AuthConfig = getConfig(platform)!; 

  const auth = new Auth(platform, config.clientID, config.clientSecret, config.scope, config.authorizationEndpoint, config.tokenEndpoint)

  let response = auth.getCodeUri(redirectUri)

  return res.json(response)
});

router.post('/', async (req: Request, res: Response) => {
  const redirectUri = req.body.redirect_uri || null;
  const platform = req.body.platform || null;
  const code = req.body.code || null;
  const refresh_token = req.body.refresh_token || null;

  if (!redirectUri) {
    throw new Error("The redirect_uri must be provided")
  }

  if (!platform) {
    throw new Error("The platform must be specified")
  }

  if (!code || refresh_token) {
    throw new Error("Either 'code' or 'refresh_token' must be provided for authentication.");
  }

  const config: AuthConfig = getConfig(platform)!; 

  const auth = new Auth(platform, config.clientID, config.clientSecret, config.scope, config.authorizationEndpoint, config.tokenEndpoint)
  
  let response = await auth.authenticate(redirectUri, code)

  return res.json(response)
});

export default router;