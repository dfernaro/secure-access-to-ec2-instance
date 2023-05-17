#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { SecureAccessToEc2InstanceStack } from "../lib/secure-access-to-ec2-instance-stack";

const app = new cdk.App();
new SecureAccessToEc2InstanceStack(app, "SecureAccessToEc2InstanceStack", {
  env: { account: "REPLACE_ME", region: "eu-west-1" },
});
