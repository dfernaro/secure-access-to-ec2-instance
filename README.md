# How to manage your instances without internet access or SSH Keys

This is a demo project which accompanies the article at https://medium.com/@dfernaro/breaking-boundaries-managing-instances-without-internet-access-or-ssh-keys-3d9ac3d3ab7b. Please, make sure that you update the file `bin/secure-access-to-ec2-instance.ts` which contains the AWS account and region.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

# AWS Diagram

![AWS Diagram](diagram/diagram.png)

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
