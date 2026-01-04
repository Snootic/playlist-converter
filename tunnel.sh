#!/bin/bash
# Cloudflare Tunnel script for development
# Since both spotify and youtube does not accept http anymore
# We'll use a simple tunnel to redirect to https on a domain
# While developing

cloudflared tunnel --url http://localhost:8081
