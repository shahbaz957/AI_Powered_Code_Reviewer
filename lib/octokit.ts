import { Octokit } from "@octokit/rest";
import { prisma } from "./prisma";

export async function getOctokitForUser(userId : string){
    const account = await prisma.account.findFirst({
        where : {
            userId, 
            providerId : 'github'
        }
    })

    if (!account?.accessToken){
        throw new Error("No Github Access Token is Found");
    }
    return new Octokit({auth : account.accessToken}); 
    // here there is no need for ? mark because we have already checked above 
}