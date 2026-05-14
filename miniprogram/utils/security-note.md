# Cloud Database Security Rules

Set these rules in the WeChat Cloud Console -> Database -> Permissions:

## users
- Read: auth.openid == doc._id
- Write: auth.openid == doc._id

## families
- Read: auth.openid in doc.members
- Write: auth.openid == doc.createdBy

## recipes
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members

## orders
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members

## inventory
- Read: auth.openid in (families where familyId matches).members
- Write: auth.openid in (families where familyId matches).members
