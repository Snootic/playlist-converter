import { Auth } from '@/services/auth';
import { AuthConfig } from '@types';
import { Request, Response, Router } from 'express';
import { getConfig } from '../../utils/detectSource';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const redirectUri = typeof req.query.redirect_uri === 'string' ? req.query.redirect_uri : null;
  const platform = typeof req.query.platform === 'string' ? req.query.platform : null;

  if (redirectUri === null) {
    return res.status(400).json({ error: "The redirect Uri must be provided" });
  }

  if (platform === null) {
    return res.status(400).json({ error: "The platform must be specified" });
  }

  const config: AuthConfig = getConfig(platform)!; 
  
  try{
    const auth = new Auth(platform, config.clientID, config.clientSecret, config.scope, config.authorizationEndpoint, config.tokenEndpoint)
  
    let response = auth.getCodeUri(redirectUri)
    return res.json(response)
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

router.post('/', async (req: Request, res: Response) => {
  const redirectUri = req.body.redirect_uri || null;
  const platform = req.body.platform || null;
  const code = req.body.code || null;
  const refresh_token = req.body.refresh_token || null;

  if (!redirectUri) {
    return res.status(400).json({ error: "The redirect Uri must be provided" });
  }

  if (!platform) {
    return res.status(400).json({ error: "The platform must be specified" });
  }
  
  if (!code && !refresh_token) {
    return res.status(400).json({ error: "Either 'code' or 'refresh_token' must be provided for authentication." });
  }

  const config: AuthConfig = getConfig(platform)!; 

  try{
    const auth = new Auth(platform, config.clientID, config.clientSecret, config.scope, config.authorizationEndpoint, config.tokenEndpoint)
    
    let response = await auth.authenticate(redirectUri, code, refresh_token)
    return res.json(response)
  } catch (e) {
   return res.status(500).json({ error: e }); 
  }
});

export default router;