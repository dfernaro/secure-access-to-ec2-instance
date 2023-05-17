import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";

export class SecureAccessToEc2InstanceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, "VPC", {
      natGateways: 0,
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    // Create a role
    const role = new iam.Role(this, "EC2InstanceSSMRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // Create a security group for the EC2 instance
    const securityGroupEc2Instance = new ec2.SecurityGroup(
      this,
      "Ec2InstanceSecurityGroup",
      {
        vpc: vpc,
        description: "SG for EC2 Instance",
      }
    );
    securityGroupEc2Instance.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      "The SSM Agent connects to Session Manager over TCP 443"
    );

    // Create a security group for VPC Endpoints
    const securityGroupVpcEndpoint = new ec2.SecurityGroup(
      this,
      "VpcEndpointSecurityGroup",
      {
        vpc: vpc,
        description: "SG for VPC Endpoints",
      }
    );
    securityGroupVpcEndpoint.addIngressRule(
      securityGroupEc2Instance,
      ec2.Port.tcp(443),
      "Allow inbound HTTPS from the EC2 instance"
    );
    securityGroupVpcEndpoint.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      "Allow outbound HTTPS to the VPC"
    );

    // VPC Endpoints for: ssm, ssmmessages and ec2messages
    vpc.addInterfaceEndpoint("ssm-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      privateDnsEnabled: true,
      securityGroups: [securityGroupVpcEndpoint],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    vpc.addInterfaceEndpoint("ssm-messages-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      privateDnsEnabled: true,
      securityGroups: [securityGroupVpcEndpoint],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    vpc.addInterfaceEndpoint("ec2-messages-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      privateDnsEnabled: true,
      securityGroups: [securityGroupVpcEndpoint],
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    });

    // Create the EC2 instance
    new ec2.Instance(this, "EC2Instance", {
      vpc: vpc,
      role: role,
      securityGroup: securityGroupEc2Instance,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
    });
  }
}
